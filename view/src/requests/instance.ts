import axios from 'axios'

import { toast } from '@/components/ui/use-toast'

const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? '/api' : undefined,
    withCredentials: true,
    timeout: 5000,
})

instance.interceptors.response.use(
    function (response) {
        return response
    },
    function (error) {
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error.toString(),
        })
        if (error.response.status) {
            if (error.response.status === 401) {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default instance
