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

export const { loginStart, loginSuccess, logoutStart, logoutSuccess } = userSlice.actions;
export default userSlice.reducer;