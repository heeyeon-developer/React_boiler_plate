import React,{ useEffect} from 'react'
import axios from 'axios'

function LandingPage() {

    useEffect(() => {//get 요청을 서버에 보낸다 엔드포인트와 같이
        axios.get('/api/hello')
        .then(response => console.log(response.data))
    },[])

    return (
        <div>
            LandingPage~~~
        </div>
    )
}

export default LandingPage
