import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isLoggedIn: false,
    loading: false
}

const userSlice = createSlice({
    name: 'user',
    initialState,

    reducers: {
        loginStart: (state) => {
            state.loading = true;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isLoggedIn = true;
            state.user = action.payload;
        },
        loginFailure: (state) => {
            state.loading = false;
            state.isLoggedIn = false;
            state.user = null;
        },
        logoutStart: (state) => {
            state.loading = true;
        },
        logoutSuccess: (state) => {
            state.loading = false;
            state.isLoggedIn = false;
            state.user = null;
        }
    }
});

export const { loginStart, loginSuccess, loginFailure, logoutStart, logoutSuccess } = userSlice.actions;
export default userSlice.reducer;