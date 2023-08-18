import { contractABI,contractAddress } from "../utils/constants";

import {ethers} from 'ethers';

import React,{useEffect,useState} from 'react';

export const TransactionContext = React.createContext();

const {ethereum} = window;
// ethereum=window object

const getEthereumContract = () => {
//v5.7.2 ethers
        const provider = new ethers.providers.Web3Provider(ethereum,'any');    
        //await provider.send('eth_requestAccounts',[]);  nel caso non fosse collegato Popup di metamask

        const signer = provider.getSigner();        

        const transactionContract = new ethers.Contract(contractAddress,contractABI,signer);        

        console.log({
            provider,
            signer,
            transactionContract
        });
        
        
        return transactionContract;
//v>6.0.0 ethers 
        // const provider = new ethers.BrowserProvider(ethereum);    
        
        // const signer = await provider.getSigner();        
        // await signer.getAddress();
        // const transactionContract = new ethers.Contract(contractAddress,contractABI,signer);        

    // console.log({
    //     provider,
    //     signer,
    //     transactionContract
    // });
}

export const TransactionProvider  = ({children}) =>{

    const [currentAccount,setCurrentAccount] = useState('');
    const [formData,setFormData] = useState({addressTo:'',amount:'',keyword:'',message:''});
    const [isLoading,setIsLoading]=useState(false);
    const [transactionCount,setTransactionCount]=useState(localStorage.getItem('transactionCount'));
    const [transactions,setTransactions]=useState([]);


    const handleChange = (e,name) => {
        setFormData((prevState) => ({...prevState,[name]:e.target.value}));
    }

    const getAllTransactions = async ()=>{
        try {
            if (!ethereum) return alert('Please install Metamask');
            const transactionContract = getEthereumContract();     
            const availableTransactions=await transactionContract.getAllTransactions();
            const structuredTransactions= availableTransactions.map((transaction)=>({
                addressTo:transaction.receiver,
                addressFrom:transaction.sender,
                timestamp:new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message:transaction.message,
                keyword:transaction.keyword,
                // amount:parseInt(ethers.utils.parseEther(transaction.amount.toString(16))._hex) / (10**18)
                amout:transaction.amout._hex / (10**18)
            }))
            setTransactions(structuredTransactions);
            console.log(availableTransactions);
            console.log(structuredTransactions);
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletConnected = async () => {
        try {

            if (!ethereum) return alert('Please install Metamask');

            const accounts=await ethereum.request({method:'eth_accounts'});

            // console.log(accounts);

            if (accounts.length) {
                setCurrentAccount(accounts[0])
                getAllTransactions();
                console.log(accounts);
            } else {
                console.log('No accounts found');
            }
                        
        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object');
        }

    }

    const checkIfTransactionExist = async() => {
        try {
            const transactionContract = getEthereumContract();     
            const  transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem('transactionCount',transactionCount);
        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object');
        }
    }
    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please install Metamask');

            const accounts=await ethereum.request({method:'eth_requestAccounts'});

            setCurrentAccount(accounts[0]);

        } catch (error) {
            console.log(error);

            throw new Error('No ethereum object');
            
        }
    }

    const sendTransaction = async() => {
        try {
            if (!ethereum) return alert('Please install Metamask');   
            const {addressTo,amount,keyword,message}=formData;
            const transactionContract = getEthereumContract();     
//v5.7.2 ethers            
            const parseAmount=ethers.utils.parseEther(amount);
//v>6.0.0 ethers
            // const parseAmount=ethers.parseEther(amount);
            console.log(transactionContract);

            await ethereum.request({
                method:'eth_sendTransaction',
                params: [{
                    from:currentAccount,
                    to:addressTo,
                    gas:'0x5208',  //21000 wei
                    value:parseAmount._hex, 
                    //v>6.0.0 ethers
                    // value: parseAmount.toString(16), //0.00001
                }]
            });

            const transactionHash = await transactionContract["addToBlockchain(address,uint256,string,string)"](addressTo,parseAmount,message,keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const  transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());
            console.log(transactionCount.toNumber());

            window.reload();
            
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object.');
        }
    }

    useEffect(() => {
        checkIfWalletConnected();
        checkIfTransactionExist();
    },[]);

    return(
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,setFormData,handleChange,sendTransaction,transactions,isLoading}}> 
            {children}
        </TransactionContext.Provider> 
    );
}





