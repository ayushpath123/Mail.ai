import axios from 'axios'
type hunterschema={
    first_name:string,
    last_name:string,
    domain:string
}
export default async function Hunterfn({first_name,last_name,domain}:hunterschema) {
    const api_key = process.env.HUNTER_API;
    const response=await axios.get('https://api.hunter.io/v2/email-finder?',{
        params:{
            first_name,
            last_name,
            domain,
            api_key
        }
    })
    if(response.status===200){
        return ({
            msg:"Email fetched Successfully",
            email:response.data.data.email
        })
    }
    else{
        return ({
            msg:"Not getting the emails",
            email:""
        })
    }
}