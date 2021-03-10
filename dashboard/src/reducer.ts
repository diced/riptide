export const LOGIN = 1;
export const LOGOUT = 2;
export const GUILDS = 3;
export const FULL_LOGIN = 4;

const initialState: State = {
  user: null,
  accessToken: null,
  guilds: []
};

export interface State {
  user: any;
  accessToken: string;
  guilds: any[];
}

export function reducer(state = initialState, action) {
  switch (action.type) {
  case LOGIN:
    return { ...state, user: action.payload };
  case LOGOUT:
    return { ...state, user: null };
  case GUILDS:
    return { ...state, guilds: action.payload };
  case FULL_LOGIN:
    return { ...state, user: action.payload.user, accessToken: action.payload.accessToken };
  default:
    return state;
  }
}