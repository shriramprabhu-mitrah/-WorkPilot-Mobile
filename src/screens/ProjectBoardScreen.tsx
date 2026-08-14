import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import {
  addColumn,
  addTaskToTodo,
  clearBoard,
  resetBoard,
} from '../store/project_store/reducer/projectBoard.reducer';

import BoardColumn from '../components/BoardColumn';
import AddNewColumn from '../components/AddNewColumn';
import AddTaskModal from '../components/AddTaskModal';

const ProjectBoardScreen = () => {
  const dispatch = useDispatch();

  const [showAddTask, setShowAddTask] = useState(false);

  const columns = useSelector((state: RootState) => state.projectBoard.columns);

  //   useEffect(() => {
  //     dispatch(resetBoard());
  //   }, []);

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
    dispatch(
      addTaskToTodo({
        id: Date.now().toString(),
        title: summary,
        description: '',
      }),
    );
  };

  const handleCardPress = (cardId: string) => {
    console.log('Card:', cardId);
  };

  const handleAddCard = (columnId: string) => {
    if (columnId !== 'todo') {
      return;
    }

    setShowAddTask(true);
  };

  const handleColumnMore = (columnId: string) => {
    console.log('Column:', columnId);
  };

  return (
    <View className='flex-1'>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexGrow: 1,
        }}
      >
        {columns.map(column => (
          <BoardColumn
            key={column.id}
            column={column}
            onCardPress={handleCardPress}
            onAddCard={handleAddCard}
            onMorePress={handleColumnMore}
          />
        ))}

        <AddNewColumn onPress={handleAddColumn} />
      </ScrollView>
      <AddTaskModal
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAddTask={handleCreateTask}
      />
    </View>
  );
};

export default ProjectBoardScreen;
