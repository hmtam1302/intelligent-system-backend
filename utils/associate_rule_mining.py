# Preperation
from itertools import combinations
from mlxtend.frequent_patterns import apriori
import pandas as pd
import numpy as np
import sys

support = float(sys.argv[1])
confidence = float(sys.argv[2])
movieId = int(sys.argv[3])

ratings = pd.read_csv('./utils/ratings.csv')
movies = pd.read_csv('./utils/movies.csv')
df = pd.merge(left=ratings, right=movies, on='movieId')
df.drop(['timestamp'], axis=1, inplace=True)
df = df.drop_duplicates(['userId', 'movieId'])
df_pivot = df.pivot(index='userId', columns='movieId',
                    values='rating').fillna(0)
df_pivot = df_pivot.astype('int64')


def encode_ratings(x):
    if x <= 0:
        return 0
    if x >= 1:
        return 1


df_pivot = df_pivot.applymap(encode_ratings)


# Apriori algorithm
def _generate_new_combination(old_combinations):
    previous_items = np.unique(old_combinations.flatten())

    for old in old_combinations:
        max_combination = old[-1]
        mask = previous_items > max_combination
        valid_items = previous_items[mask]
        old_tuple = tuple(old)

        for item in valid_items:
            yield from old_tuple
            yield item


def _support(x, rows):
    out = x.sum(axis=0)/rows
    return np.array(out).reshape(-1)


def apriori_algorithm(dataset, min_support=0.2):
    X = dataset.values
    support = _support(X, X.shape[0])
    ary_col_idx = np.arange(X.shape[1])
    support_dict = {1: support[support >= min_support]}
    itemset_dict = {1: ary_col_idx[support >= min_support].reshape(-1, 1)}
    max_itemset = 1
    rows_count = float(X.shape[0])
    all_ones = np.ones((int(rows_count), 1))

    # Find frequent itemset
    while True:
        next_max_itemset = max_itemset + 1
        combin = _generate_new_combination(itemset_dict[max_itemset])
        combin = np.fromiter(combin, dtype=int)
        combin = combin.reshape(-1, next_max_itemset)

        if combin.size == 0:
            break
        _bools = np.all(X[:, combin], axis=2)

        support = _support(np.array(_bools), rows_count)
        _mask = (support >= min_support).reshape(-1)
        if any(_mask):
            itemset_dict[next_max_itemset] = np.array(combin[_mask])
            support_dict[next_max_itemset] = np.array(support[_mask])
            max_itemset = next_max_itemset
        else:
            # Exit condition
            break

    all_res = []
    for k in sorted(itemset_dict):
        support = pd.Series(support_dict[k])
        itemsets = pd.Series([frozenset(i)
                             for i in itemset_dict[k]], dtype='object')
        res = pd.concat((support, itemsets), axis=1)
        all_res.append(res)

    res_df = pd.concat(all_res)
    res_df.columns = ['support', 'itemsets']

    mapping = {idx: item for idx, item in enumerate(dataset.columns)}
    res_df['itemsets'] = res_df['itemsets'].apply(
        lambda x: frozenset([mapping[i] for i in x]))

    res_df = res_df.reset_index(drop=True)
    return res_df


# Associate rule mining
def _confidence_score(sAC, sA):
    return sAC/sA


def association_rules(df, min_confidence=0.8):
    # get dict of {frequent itemset} -> support
    keys = df['itemsets'].values
    values = df['support'].values
    frozenset_vect = np.vectorize(lambda x: frozenset(x))
    frequent_items_dict = dict(zip(frozenset_vect(keys), values))

    # prepare buckets to collect frequent rules
    rule_antecedents = []
    rule_consequents = []
    rule_supports = []

    # iterate over all frequent itemsets
    for k in frequent_items_dict.keys():
        sAC = frequent_items_dict[k]
        # to find all possible combinations
        for idx in range(len(k)-1, 0, -1):
            # of antecedent and consequent
            for c in combinations(k, r=idx):
                antecedent = frozenset(c)
                consequent = k.difference(antecedent)

                sA = frequent_items_dict[antecedent]
                sC = frequent_items_dict[consequent]

                score = _confidence_score(sAC, sA)
                if score >= min_confidence:
                    rule_antecedents.append(antecedent)
                    rule_consequents.append(consequent)
                    rule_supports.append([sAC, sA, sC])

    # check if frequent rule was generated
    if not rule_supports:
        return pd.DataFrame(
            columns=["antecedents", "consequents"] + columns_ordered)

    else:
        # generate metrics
        rule_supports = np.array(rule_supports).T.astype(float)
        df_res = pd.DataFrame(
            data=list(zip(rule_antecedents, rule_consequents)),
            columns=["antecedents", "consequents"])

        sAC = rule_supports[0]
        sA = rule_supports[1]
        sC = rule_supports[2]
        df_res["confidence"] = _confidence_score(sAC, sA)

        return df_res


frequent_itemset = apriori_algorithm(df_pivot, min_support=support)
rules = association_rules(frequent_itemset, min_confidence=confidence)
rules = rules.sort_values('confidence', ascending=False)

value = []
for index, row in rules.iterrows():
    if movieId in row['antecedents']:
        value += list(row['consequents'])
print(value)
