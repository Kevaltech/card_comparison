// features/cards/cardsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_COMPARE_URL = "https://6a33-59-162-82-6.ngrok-free.app/compare/";
const CARDS_STATUS_URL =
  "https://6a33-59-162-82-6.ngrok-free.app/cards-by-status/";
const UPDATE_STATUS_URL =
  "https://6a33-59-162-82-6.ngrok-free.app/update-card-status/";

export const fetchCards = createAsyncThunk(
  "cards/fetchCards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(CARDS_STATUS_URL, {
        headers: { "ngrok-skip-browser-warning": "234242" },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch cards");
    }
  }
);

export const fetchCardDetails = createAsyncThunk(
  "cards/fetchCardDetails",
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_COMPARE_URL}${cardId}`, {
        headers: { "ngrok-skip-browser-warning": "234242" },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch card details"
      );
    }
  }
);

export const updateCardStatus = createAsyncThunk(
  "cards/updateCardStatus",
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${UPDATE_STATUS_URL}${cardId}/`,
        {},
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update status");
    }
  }
);

const cardsSlice = createSlice({
  name: "cards",
  initialState: {
    banksData: {},
    generalBanksData: {},
    selectedCard: null,
    cardData: null,
    status: "idle",
    error: null,
    statusMessage: null,
  },
  reducers: {
    setSelectedCard: (state, action) => {
      state.selectedCard = action.payload;
    },
    clearStatusMessage: (state) => {
      state.statusMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cards
      .addCase(fetchCards.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { General, ...regularBanks } = action.payload;
        state.banksData = regularBanks;
        state.generalBanksData = General || {};
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Card Details
      .addCase(fetchCardDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCardDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cardData = action.payload;
      })
      .addCase(fetchCardDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update Card Status
      .addCase(updateCardStatus.pending, (state) => {
        state.status = "updating";
      })
      .addCase(updateCardStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.statusMessage = {
          text: `Successfully updated card status to ${action.payload.data.status}`,
        };
        if (state.cardData) {
          state.cardData.cardStatus = action.payload.data.status;
        }
      })
      .addCase(updateCardStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.statusMessage = {
          text: action.payload || "Failed to update status",
        };
      });
  },
});

export const { setSelectedCard, clearStatusMessage } = cardsSlice.actions;

export default cardsSlice.reducer;

// Selectors
export const selectAllBanks = (state) => state.cards.banksData;
export const selectGeneralBanks = (state) => state.cards.generalBanksData;
export const selectCardData = (state) => state.cards.cardData;
export const selectSelectedCard = (state) => state.cards.selectedCard;
export const selectStatus = (state) => state.cards.status;
export const selectError = (state) => state.cards.error;
export const selectStatusMessage = (state) => state.cards.statusMessage;
