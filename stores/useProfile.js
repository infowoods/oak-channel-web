import React from 'react'

export const ProfileContext = React.createContext({})

export const state = {
  profile: {},
  userInfo: {},
  isLogin: null,
}

export function reducer(preState, action) {
  const { type } = action
  console.log('>>> action: ', action)
  switch (type) {
    case 'profile':
      return {
        ...preState,
        profile: action.profile,
      }
    case 'userInfo':
      return {
        ...preState,
        userInfo: action.userInfo,
      }
    case 'isLogin':
      return {
        ...preState,
        isLogin: action.isLogin,
      }
    default:
      return preState
  }
}
