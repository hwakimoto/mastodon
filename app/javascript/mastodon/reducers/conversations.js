import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import {
  CONVERSATIONS_FETCH_REQUEST,
  CONVERSATIONS_FETCH_SUCCESS,
  CONVERSATIONS_FETCH_FAIL,
  CONVERSATIONS_UPDATE,
} from '../actions/conversations';
import compareId from '../compare_id';

const initialState = ImmutableMap({
  items: ImmutableList(),
  isLoading: false,
  hasMore: true,
});

const conversationToMap = item => ImmutableMap({
  id: item.id,
  accounts: ImmutableList(item.accounts.map(a => a.id)),
  last_status: item.last_status.id,
});

const updateConversation = (state, item) => state.update('items', list => {
  const index = list.findIndex(x => x.get('id') === item.id);

  if (index !== -1) {
    return list.set(index, conversationToMap(item));
  } else {
    return list.unshift(conversationToMap(item));
  }
});

const expandNormalizedConversations = (state, notifications, next) => {
  let items = ImmutableList();

  notifications.forEach((n, i) => {
    items = items.set(i, conversationToMap(n));
  });

  return state.withMutations(mutable => {
    if (!items.isEmpty()) {
      mutable.update('items', list => {
        const lastIndex = 1 + list.findLastIndex(
          item => item !== null && (compareId(item.get('id'), items.last().get('id')) > 0 || item.get('id') === items.last().get('id'))
        );

        const firstIndex = 1 + list.take(lastIndex).findLastIndex(
          item => item !== null && compareId(item.get('id'), items.first().get('id')) > 0
        );

        return list.take(firstIndex).concat(items, list.skip(lastIndex));
      });
    }

    if (!next) {
      mutable.set('hasMore', false);
    }

    mutable.set('isLoading', false);
  });
};

export default function conversations(state = initialState, action) {
  switch (action.type) {
  case CONVERSATIONS_FETCH_REQUEST:
    return state.set('isLoading', true);
  case CONVERSATIONS_FETCH_FAIL:
    return state.set('isLoading', false);
  case CONVERSATIONS_FETCH_SUCCESS:
    return expandNormalizedConversations(state, action.conversations, action.next);
  case CONVERSATIONS_UPDATE:
    return updateConversation(state, action.conversation);
  default:
    return state;
  }
};
