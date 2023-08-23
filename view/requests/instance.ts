import axios from "axios"

import {toast} from "@/components/ui/use-toast"


const instance = axios.create({
    withCredentials: true
})

instance.interceptors.response.use(
    function (response) {
        return response
    },
    function (error) {
        toast({
            title: 'Uh oh! Something went wrong.',
            description: error
        })
        return Promise.reject(error)
    }
)

export default instance