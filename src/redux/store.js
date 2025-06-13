// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import cardsReducer from "./slice/cardsSlice";

export const store = configureStore({
  reducer: {
    cards: cardsReducer,
  },
});
