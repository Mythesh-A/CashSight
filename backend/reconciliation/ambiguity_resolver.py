"""
ambiguity_resolver.py

Turns subset_sum_matcher's list of candidate order combinations into a
final decision. The "don't guess" rule lives in exactly this one place:
if more than one distinct combination validly sums to the settlement
amount, the engine refuses to pick one and flags it for human review
instead.
"""


def resolve(candidates):
    """
    candidates: list of order_id lists, as returned by
    subset_sum_matcher.find_order_combinations

    Returns (status, order_ids):
      "resolved"    -> exactly one valid combination; order_ids is it
      "ambiguous"   -> 2+ valid combinations; order_ids is None
      "unresolved"  -> 0 valid combinations; order_ids is None
    """
    if len(candidates) == 0:
        return "unresolved", None
    if len(candidates) == 1:
        return "resolved", candidates[0]
    return "ambiguous", None
