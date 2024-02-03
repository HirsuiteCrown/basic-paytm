import axios from "axios";
import { useEffect, useState } from "react"

export const Balance = () => {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    // Handle not logged in case
                    return;
                }

                const response = await axios.get("http://localhost:3000/api/v1/account/balance", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setBalance(response.data.balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
                // Handle error as needed
            }
        };

        fetchBalance();
    }, []);


    return <div className="flex">
        <div className="font-bold text-lg">
            Your balance
        </div>
        <div className="font-semibold ml-4 text-lg">
            Rs {balance}
        </div> 
    </div>
}