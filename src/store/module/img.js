
import {segmentImg} from '@/api/img';

export default {
  state: {
   img:undefined,
  },
  mutations: {
    setImg (state, img) {
      state.img = img
    },
  },
  getters: {
    getImg: state => state.img,
  },
  actions: {
    //处理
    segmentImg({ state, commit },{ img }){
      return new Promise((resolve, reject) => {
        segmentImg({
          imgObject:img,
        }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 登录
/*
    handleLogin ({ commit }, { userName, password }) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          password
        }).then(res => {
          const data = res.data
          if (data.token === 'admin') {
            commit('setToken', data.token)
            resolve({ msg: 'success' })
          } else {
            resolve({ msg: 'failed' })
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
*/

  }
}
