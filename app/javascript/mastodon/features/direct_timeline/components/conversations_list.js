import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ConversationContainer from '../containers/conversation_container';
import ScrollableList from '../../../components/scrollable_list';
import { debounce } from 'lodash';

export default class ConversationsList extends ImmutablePureComponent {

  static propTypes = {
    conversations: ImmutablePropTypes.list.isRequired,
    hasMore: PropTypes.bool,
    isLoading: PropTypes.bool,
    onLoadMore: PropTypes.func,
  };

  handleLoadOlder = debounce(() => {
    const last = this.props.conversations.last();

    if (last) {
      this.props.onLoadMore(last.get('id'));
    }
  }, 300, { leading: true })

  render () {
    const { conversations, onLoadMore, ...other } = this.props;

    return (
      <ScrollableList {...other} onLoadMore={onLoadMore && this.handleLoadOlder} scrollKey='direct'>
        {conversations.map(item => (
          <ConversationContainer key={item.get('id')} conversation={item} />
        ))}
      </ScrollableList>
    );
  }

}
