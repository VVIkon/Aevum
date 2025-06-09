import { defineStore } from 'pinia'
import axios from 'axios'
import { AUTH_PATHS } from '@/constants'
import Cookies from 'js-cookie';


export interface IAuthUser {
  userId: number;
  email: string;
  roles: string[],
  active: number,
  fio: string,
}

interface State {
  token?: string
  status: 'logout' | 'got_token' | 'got_user' | 'success' | 'access_denid'
  role: 'guest' | 'user' | 'superUser' | 'admin'
  authUser: IAuthUser | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    token: '',
    role: 'guest',
    status: 'logout',
    authUser: null,
  }),

  getters: {
    getToken(state): string {
        state.token = Cookies.get('token') || '';
        return state.token;
    },
    // isTokenated(state): boolean {
    //   return !!state.token
    //   // return !!this.getToken
    // }
  },

  actions: {
    async getAccessToken(name: string, pass: string) {
      try {
        const data = await axios.post(AUTH_PATHS.AUTH_URL, { name, pass })
        const { access_token, expires } = data?.data
        if (access_token && expires) {
          Cookies.set('token', access_token, { expires: Number(expires) });
          this.status = 'got_token';
          this.token = await access_token;
          // console.log('>>> 0 isTokenated.value: ', !!this.token );
        }
      } catch (error) {
        console.error('getAccessToken Error: ', error)
        throw error
      }
    },
    async getProfile() {
      try {
        const token = this.token;
        // console.log('>>> getProfile.token: ', token)
        const { data } = await axios.get(AUTH_PATHS.AUTH_PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // console.log('>>> getProfile.data: ', data)
        if (data) {
          this.status = 'got_user';
          this.authUser = await data;
        }
      } catch (error) {
        console.error('getProfile Error: ', error)
        throw error
      }
    }

  }
})
