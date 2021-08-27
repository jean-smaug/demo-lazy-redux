import { createSlice } from "@reduxjs/toolkit";
import shaka from "shaka-player";

export const playerSlice = createSlice({
  name: "player",
  initialState: {
    video: "idle",
  },
  reducers: {
    test: () => {
      shaka();
    },
  },
});
