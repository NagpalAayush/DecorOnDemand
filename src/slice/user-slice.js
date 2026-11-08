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
        },
        registerAsListerSuccess: (state) => {
            if (state.user) {
                state.user.isLister = true;
            }
        },
        deregisterAsListerSuccess: (state) => {
            if (state.user) {
                state.user.isLister = false;
            }
        }
    }
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logoutStart,
    logoutSuccess,
    registerAsListerSuccess,
    deregisterAsListerSuccess,
} = userSlice.actions;
export default userSlice.reducer;