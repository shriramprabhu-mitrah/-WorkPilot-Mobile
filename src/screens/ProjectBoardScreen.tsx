import React, { useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import {
  addColumn,
  addTaskToTodo,
  deleteColumn,
  moveCard,
  moveColumnRight,
  updateColumn,
} from '../store/project_store/reducer/projectBoard.reducer';

import BoardColumn from '../components/BoardColumn';
import AddNewColumn from '../components/AddNewColumn';
import AddTaskModal from '../components/AddTaskModal';
import RenameColumnModal from '../components/RenameColumnModal';
import DeleteColumnModal from '../components/DeleteColumnModal';
import { BoardCard as BoardCardType } from '../types/projectBoard.type';
import { AppText } from '../components';

const COLUMN_WIDTH = 300;
const COLUMN_GAP = 16;
const HORIZONTAL_PADDING = 16;

const ProjectBoardScreen = () => {
  const dispatch = useDispatch();
  const { height } = useWindowDimensions();

  const [showAddTask, setShowAddTask] = useState(false);
  const [renameColumnId, setRenameColumnId] = useState<string | null>(null);
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [boardScrollX, setBoardScrollX] = useState(0);

  const [draggingCard, setDraggingCard] = useState<BoardCardType | null>(null);

  const [dragPosition, setDragPosition] = useState({
    x: 0,
    y: 0,
  });

  const columns = useSelector((state: RootState) => state.projectBoard.columns);

  const renameColumn = columns.find(column => column.id === renameColumnId);
  const selectedDeleteColumn = columns.find(
    column => column.id === deleteColumnId,
  );

  const handleRenameColumn = (columnId: string) => {
    setRenameColumnId(columnId);
  };

  const handleDragStart = (card: BoardCardType, x: number, y: number) => {
    setDraggingCard(card);

    setDragPosition({
      x,
      y,
    });
  };

  const handleSaveRename = (title: string) => {
    if (!renameColumnId) {
      return;
    }

    dispatch(
      updateColumn({
        id: renameColumnId,
        title,
      }),
    );

    setRenameColumnId(null);
  };

  const handleDrag = (card: BoardCardType, x: number, y: number) => {
    setDragPosition({
      x,
      y,
    });
  };

  const handleDragEnd = (
    card: BoardCardType,
    fromColumnId: string,
    x: number,
    y: number,
  ) => {
    const contentX = x - HORIZONTAL_PADDING + boardScrollX;

    const columnIndex = Math.floor(contentX / (COLUMN_WIDTH + COLUMN_GAP));

    if (columnIndex >= 0 && columnIndex < columns.length) {
      const targetColumn = columns[columnIndex];

      if (targetColumn && targetColumn.id !== fromColumnId) {
        dispatch(
          moveCard({
            cardId: card.id,
            fromColumnId,
            toColumnId: targetColumn.id,
          }),
        );
      }
    }

    // IMPORTANT:
    // Remove overlay after drop
    setDraggingCard(null);
  };

  const handleMoveRight = (columnId: string) => {
    const index = columns.findIndex(column => column.id === columnId);

    if (index === columns.length - 1) {
      return;
    }

    dispatch(moveColumnRight(columnId));
  };

  const handleAddColumn = () => {
    dispatch(
      addColumn({
        id: Date.now().toString(),
        title: 'New Column',
        cards: [],
      }),
    );
  };

  const handleCreateTask = (summary: string) => {
    const trimmedSummary = summary.trim();

    if (!trimmedSummary) {
      return;
    }

    dispatch(
      addTaskToTodo({
        id: Date.now().toString(),
        title: trimmedSummary,
        description: '',
      }),
    );

    setShowAddTask(false);
  };

  const handleAddCard = (columnId: string) => {
    // Only To Do can create a new task
    if (columnId !== 'todo') {
      return;
    }

    setShowAddTask(true);
  };

  const handleCardPress = (cardId: string) => {
    console.log('Card:', cardId);
  };

  const handleDeleteColumn = (columnId: string) => {
    setDeleteColumnId(columnId);
  };

  const handleConfirmDelete = () => {
    if (!deleteColumnId) {
      return;
    }

    dispatch(deleteColumn(deleteColumnId));

    setDeleteColumnId(null);
  };

  const handleCardDragEnd = (
    cardId: string,
    fromColumnId: string,
    absoluteX: number,
    absoluteY: number,
  ) => {
    const contentX = absoluteX - HORIZONTAL_PADDING + boardScrollX;

    const columnIndex = Math.floor(contentX / (COLUMN_WIDTH + COLUMN_GAP));

    if (columnIndex < 0 || columnIndex >= columns.length) {
      return;
    }

    const targetColumn = columns[columnIndex];

    if (!targetColumn) {
      return;
    }

    if (targetColumn.id === fromColumnId) {
      return;
    }

    dispatch(
      moveCard({
        cardId,
        fromColumnId,
        toColumnId: targetColumn.id,
      }),
    );
  };

  const renderColumn = ({ item }: { item: (typeof columns)[number] }) => {
    return (
      <View
        style={{
          width: COLUMN_WIDTH,
          marginRight: COLUMN_GAP,
        }}
      >
        <BoardColumn
          column={item}
          boardHeight={height - 600}
          onCardPress={handleCardPress}
          onAddCard={handleAddCard}
          onRename={handleRenameColumn}
          onMoveRight={handleMoveRight}
          onDelete={handleDeleteColumn}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={(card, x, y) => handleDragEnd(card, item.id, x, y)}
          draggingCardId={draggingCard?.id}
        />
      </View>
    );
  };

  return (
    <View className='flex-1'>
      <FlatList
        data={columns}
        horizontal
        keyExtractor={item => item.id}
        renderItem={renderColumn}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        snapToInterval={COLUMN_WIDTH + COLUMN_GAP}
        decelerationRate='fast'
        snapToAlignment='start'
        onScroll={event => {
          setBoardScrollX(event.nativeEvent.contentOffset.x);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingVertical: 16,
        }}
        ListFooterComponent={
          <View
            style={{
              width: COLUMN_WIDTH,
              marginRight: HORIZONTAL_PADDING,
            }}
          >
            <AddNewColumn onPress={handleAddColumn} />
          </View>
        }
      />

      <AddTaskModal
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAddTask={handleCreateTask}
      />

      {renameColumn && (
        <RenameColumnModal
          visible={!!renameColumnId}
          currentTitle={renameColumn.title}
          onClose={() => setRenameColumnId(null)}
          onRename={handleSaveRename}
        />
      )}

      {selectedDeleteColumn && (
        <DeleteColumnModal
          visible={!!deleteColumnId}
          columnTitle={selectedDeleteColumn.title}
          onClose={() => setDeleteColumnId(null)}
          onDelete={handleConfirmDelete}
        />
      )}

      {draggingCard && (
        <View
          pointerEvents='none'
          style={{
            position: 'absolute',

            left: dragPosition.x - COLUMN_WIDTH / 2,
            top: dragPosition.y - 30,

            width: COLUMN_WIDTH,

            zIndex: 9999,
            elevation: 20,
          }}
        >
          <View className='rounded-xl bg-white p-4 shadow-lg'>
            <AppText variant='body'>{draggingCard.title}</AppText>

            {draggingCard.description && (
              <View className='mt-2'>
                <AppText variant='body'>{draggingCard.description}</AppText>
              </View>
            )}

            {draggingCard.priority && (
              <View className='mt-3 self-start rounded-md bg-gray-100 px-2 py-1'>
                <AppText variant='body'>{draggingCard.priority}</AppText>
              </View>
            )}

            {draggingCard.assignee && (
              <View className='mt-3'>
                <AppText variant='body'>{draggingCard.assignee.name}</AppText>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default ProjectBoardScreen;
