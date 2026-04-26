import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type AIModel } from '../../api/modelsApi';

interface ModelState {
  models: AIModel[];
}

const initialState: ModelState = {
  models: [],
};

const modelSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
  
    setModels: (state, action: PayloadAction<AIModel[]>) => {
      state.models = action.payload;
    },
    
    addModel: (state, action: PayloadAction<AIModel>) => {
      state.models.unshift(action.payload);
    },
    
    updateModel: (state, action: PayloadAction<AIModel>) => {
      const index = state.models.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.models[index] = action.payload;
      }
    },
    
    deleteModel: (state, action: PayloadAction<string>) => {
      state.models = state.models.filter((m) => m.id !== action.payload);
    },
  },
});

export const { setModels, addModel, updateModel, deleteModel } = modelSlice.actions;
export default modelSlice.reducer;