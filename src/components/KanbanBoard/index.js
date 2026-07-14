import React, { useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const LaneScrollSentinel = ({ hasMore, loading, onLoadMore, rootRef }) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || loading || !onLoadMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { root: rootRef?.current || null, rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, rootRef]);

  if (!hasMore && !loading) return null;
  return (
    <Box
      ref={sentinelRef}
      sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
    >
      {loading && <CircularProgress size={18} />}
    </Box>
  );
};

LaneScrollSentinel.propTypes = {
  hasMore: PropTypes.bool,
  loading: PropTypes.bool,
  onLoadMore: PropTypes.func,
  rootRef: PropTypes.object,
};

const Lane = ({
  lane,
  laneStyle,
  LaneHeader,
  CardComponent,
  AddCardLink,
  onCardClick,
  t,
}) => {
  const laneId = String(lane.laneId ?? lane.id);
  const scrollRef = useRef(null);

  return (
    <Box
      sx={{
        minWidth: 350,
        display: 'flex',
        flexDirection: 'column',
        ...laneStyle,
      }}
    >
      {LaneHeader ? (
        <LaneHeader {...lane} />
      ) : (
        <Typography variant="subtitle1" sx={{ p: 1, fontWeight: 600 }}>
          {lane.title}
        </Typography>
      )}

      <Droppable droppableId={laneId}>
        {(provided) => (
          <Box
            ref={(node) => {
              provided.innerRef(node);
              scrollRef.current = node;
            }}
            {...provided.droppableProps}
            sx={{ flex: 1, overflowY: 'auto', p: 0.5 }}
          >
            {!lane.cards?.length && lane.emptyState && (
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider',
                  p: 2,
                  mb: 1,
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {lane.emptyState.message}
                </Typography>
                {lane.emptyState.actionLabel && lane.emptyState.onAction && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={lane.emptyState.onAction}
                  >
                    {lane.emptyState.actionLabel}
                  </Button>
                )}
              </Box>
            )}
            {lane.cards?.map((card, index) => (
              <Draggable
                key={String(card.id)}
                draggableId={String(card.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() =>
                      onCardClick && onCardClick(card.id, card, laneId)
                    }
                    sx={{
                      mb: 1,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                      cursor: 'pointer',
                    }}
                  >
                    {CardComponent ? (
                      <CardComponent
                        {...card}
                        laneId={laneId}
                        onClick={() =>
                          onCardClick && onCardClick(card.id, card, laneId)
                        }
                      />
                    ) : (
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      >
                        <Typography variant="body2">{card.title}</Typography>
                        {card.description && (
                          <Typography variant="caption" color="text.secondary">
                            {card.description}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            <LaneScrollSentinel
              hasMore={Boolean(lane.hasMore)}
              loading={Boolean(lane.loading)}
              onLoadMore={lane.onLoadMore}
              rootRef={scrollRef}
            />
          </Box>
        )}
      </Droppable>

      {AddCardLink && (
        <AddCardLink laneId={laneId} onClick={() => t && t(laneId)} />
      )}
    </Box>
  );
};

Lane.propTypes = {
  lane: PropTypes.object.isRequired,
  laneStyle: PropTypes.object,
  LaneHeader: PropTypes.elementType,
  CardComponent: PropTypes.elementType,
  AddCardLink: PropTypes.elementType,
  onCardClick: PropTypes.func,
  t: PropTypes.func,
};

/**
 * Drop-in replacement for react-trello Board component using @hello-pangea/dnd.
 * Supports the same props API as the original react-trello Board:
 * - data: { lanes: [{ id, title, cards: [{ id, ...}] }] }
 * - handleDragEnd(cardId, sourceLaneId, targetLaneId, position, cardDetails)
 * - onCardClick(cardId, metadata, laneId)
 * - onCardAdd(card, laneId)
 * - laneStyle: styles for lane containers
 * - components: { BoardWrapper, Card, LaneHeader, AddCardLink, NewCardForm }
 * - t: callback for add card button text/action
 */
const KanbanBoard = ({
  data,
  handleDragEnd,
  onCardClick,
  onCardAdd,
  laneStyle = {},
  components = {},
  t,
  editable,
  canAddLanes,
}) => {
  const {
    BoardWrapper,
    Card: CardComponent,
    LaneHeader,
    AddCardLink,
  } = components;

  const onDragEnd = (result) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;

    const sourceLaneId = source.droppableId;
    const targetLaneId = destination.droppableId;
    const position = destination.index;

    const sourceLane = data?.lanes?.find(
      (l) => String(l.laneId ?? l.id) === String(sourceLaneId),
    );
    const cardDetails = sourceLane?.cards?.find(
      (c) => String(c.id) === String(draggableId),
    );

    if (handleDragEnd) {
      handleDragEnd(draggableId, sourceLaneId, targetLaneId, position, cardDetails);
    }
  };

  const Wrapper = BoardWrapper || Box;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Wrapper>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', height: '100%' }}>
          {data?.lanes?.map((lane) => (
            <Lane
              key={String(lane.laneId ?? lane.id)}
              lane={lane}
              laneStyle={laneStyle}
              LaneHeader={LaneHeader}
              CardComponent={CardComponent}
              AddCardLink={AddCardLink}
              onCardClick={onCardClick}
              t={t}
            />
          ))}
        </Box>
      </Wrapper>
    </DragDropContext>
  );
};

KanbanBoard.propTypes = {
  data: PropTypes.object.isRequired,
  handleDragEnd: PropTypes.func,
  onCardClick: PropTypes.func,
  onCardAdd: PropTypes.func,
  laneStyle: PropTypes.object,
  components: PropTypes.object,
  t: PropTypes.func,
  editable: PropTypes.bool,
  canAddLanes: PropTypes.bool,
};

export default KanbanBoard;
