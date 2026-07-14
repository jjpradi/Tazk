import * as React from 'react'
import { ReactNode } from 'react';
import styles from './styles.module.css'



class ScrollableFeed extends React.Component{


  constructor(props) {
    super(props);
    this.bottomRef = React.createRef();
    this.wrapperRef = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
  }

  static defaultProps = {
    forceScroll: false,
    animateScroll: (element, offset) => {
      if (element.scrollBy) {
        element.scrollBy({ top: offset });
      }
      else {
        element.scrollTop = offset;
      }
    },
    onScrollComplete: () => {},
    changeDetectionFilter: () => true,
    viewableDetectionEpsilon: 2,
    onScroll: () => {},
  };

  getSnapshotBeforeUpdate() {
    if (this.wrapperRef.current && this.bottomRef.current) {
      const { viewableDetectionEpsilon } = this.props;
      return ScrollableFeed.isViewable(this.wrapperRef.current, this.bottomRef.current, viewableDetectionEpsilon); //This argument is passed down to componentDidUpdate as 3rd parameter
    }
    return false;
  }

  componentDidUpdate(previousProps, a={}, snapshot) {
    const { forceScroll, changeDetectionFilter } = this.props;
    const isValidChange = changeDetectionFilter(previousProps, this.props);
    if (isValidChange && (forceScroll || snapshot) && this.bottomRef.current && this.wrapperRef.current) {
      this.scrollParentToChild(this.wrapperRef.current, this.bottomRef.current);
    }
  }

  componentDidMount() {
    //Scroll to bottom from the start
    if (this.bottomRef.current && this.wrapperRef.current) {
      this.scrollParentToChild(this.wrapperRef.current, this.bottomRef.current);
    }
  }

  /**
   * Scrolls a parent element such that the child element will be in view
   * @param parent
   * @param child
   */
  scrollParentToChild(parent, child) {
    const { viewableDetectionEpsilon } = this.props;
    if (!ScrollableFeed.isViewable(parent, child, viewableDetectionEpsilon)) {
      //Source: https://stackoverflow.com/a/45411081/6316091
      const parentRect = parent.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();

      //Scroll by offset relative to parent
      const scrollOffset = (childRect.top + parent.scrollTop) - parentRect.top;
      const { animateScroll, onScrollComplete } = this.props;
      if (animateScroll) {
        animateScroll(parent, scrollOffset);
        onScrollComplete();
      }
    }
  }

  /**
   * Returns whether a child element is visible within a parent element
   *
   * @param parent
   * @param child
   * @param epsilon
   */
   static isViewable(parent, child, epsilon) {
    epsilon = epsilon || 0;

    //Source: https://stackoverflow.com/a/45411081/6316091
    const parentRect = parent.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();

    const childTopIsViewable = (childRect.top >= parentRect.top);

    const childOffsetToParentBottom = parentRect.top + parent.clientHeight - childRect.top;
    const childBottomIsViewable = childOffsetToParentBottom + epsilon >= 0;

    return childTopIsViewable && childBottomIsViewable;
  }

  /**
   * Fires the onScroll event, sending isAtBottom boolean as its first parameter
   */
  handleScroll() {
    const { viewableDetectionEpsilon, onScroll } = this.props;
    if (onScroll && this.bottomRef.current && this.wrapperRef.current) {
      const isAtBottom = ScrollableFeed.isViewable(this.wrapperRef.current, this.bottomRef.current, viewableDetectionEpsilon);
      onScroll(isAtBottom);
    }
  }

  /**
   * Scroll to the bottom
   */
  scrollToBottom() {
    if (this.bottomRef.current && this.wrapperRef.current) {
      this.scrollParentToChild(this.wrapperRef.current, this.bottomRef.current);
    }
  }

  render() {
    const { children, className } = this.props;
    const joinedClassName = styles.scrollableDiv + (className ? " " + className : "");
    return (
      <div className={joinedClassName} ref={this.wrapperRef} onScroll={this.handleScroll}>
        {children}
        <div ref={this.bottomRef}></div>
      </div>
    );
  }
}

export default ScrollableFeed;