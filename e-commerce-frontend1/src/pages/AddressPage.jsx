import { useEffect,useState } from "react";
import axios from "axios";
import AddressCard from "../components/AddressCard";
import AddressForm from "../components/AddressForm";

export default function AddressPage(){

const [addresses,setAddresses] = useState([]);

useEffect(()=>{
axios.get("http://localhost:8080/api/address")
.then(res=>setAddresses(res.data));
},[]);

return(

<div>

<AddressForm/>

<h2>Saved Addresses</h2>

{addresses.map(addr=>(
<AddressCard key={addr.id} address={addr}/>
))}

</div>

);
}