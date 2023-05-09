import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { Contract, ethers, providers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DAOAddress,
  fakeMarketPlaceAddress,
  NFT_CONTRACT_ADDRESS,
  CryptoDevsDAOAbi,
  NFT_CONTRACT_ABI,
} from "../constants/constants";

export default function Home() {
  const [nftBalance, setNftBalance] = useState();
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [numProposals, setNumProposals] = useState("");
  const [selectedTab, setSelectedTab] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [proposals, setProposals] = useState([
    {
      proposalId: "",
      nftTokenId: "",
      deadline: "",
      noVotes: "",
      yesVotes: "",
      executed: "",
    },
  ]);
  const [fakeNftTokenId, setFakeNftTokenId] = useState();
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [totalProposals, setTotalProposals] = useState(0);

  async function getSignerOrProviderDAO(signer = false) {
    // console.log(contractAddress, signer);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log(provider);
    let contract;
    if (signer) {
      const signer = provider.getSigner();
      contract = new ethers.Contract(DAOAddress, CryptoDevsDAOAbi, signer);

      return contract;
    }
    // console.log(contract, "con");
    contract = new ethers.Contract(DAOAddress, CryptoDevsDAOAbi, provider);
    return contract;
  }

  async function getSignerOrProviderNFT(signer = false) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    let contract;
    if (signer) {
      const signer = provider.getSigner();
      contract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      return contract;
    }
    contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      NFT_CONTRACT_ABI,
      provider
    );
    return contract;
  }

  async function connectWallet() {
    try {
      if (window.ethereum) {
        const temp = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(temp[0]);
      } else {
        throw new Error("Install metamask");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function isWalletDisconnectedOrConnected() {
    try {
      if (window.ethereum) {
        const temp = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (temp.length == 0) {
          setCurrentAccount(null);
        } else {
          setCurrentAccount(temp[0]);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  const voteOnProposal = async (id, _vote) => {
    try {
      const contract = await getSignerOrProviderDAO(true);
      let vote = _vote === "Yes" ? 0 : 1;
      const tx = await contract.vote(id, vote);
      setLoading(true);
      // console.log("hehehe");
      // getTotalProposals();
      tx.wait();

      setLoading(false);
      toast.success("Success", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      getProposals();
    } catch (err) {
      setLoading(false);
      const a = JSON.stringify(err);
      // console.log(JSON.parse(a).reason);
      toast.error(JSON.parse(a).reason, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const withdrawDAOEther = async () => {
    try {
      setLoading(true);
      const contract = await getSignerOrProviderDAO(true);
      const tx = await contract.withdrawEther();
      tx.wait();
      // setLoading(false);
      // getTotalProposals();
      // getProposals();

      toast.success("Successfuly created", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const a = JSON.stringify(err);
      // console.log(JSON.parse(a).reason);
      toast.error(JSON.parse(a).reason, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const checkOwner = async () => {
    try {
      const contract = await getSignerOrProviderDAO();
      // console.log(contract);
      const owner = await contract.owner();
      if (owner.toLowerCase() === currentAccount.toLowerCase()) {
        setIsOwner(true);
      } else {
        console.log("hhh");
        setIsOwner(false);
      }
    } catch (err) {}
  };

  const getNftBalance = async () => {
    try {
      // console.log("hit");
      const contract = await getSignerOrProviderNFT();
      // console.log(contract);
      const balance = await contract.balanceOf(currentAccount);
      // console.log("heh", parseInt(balance));
      setNftBalance(parseInt(balance));
    } catch (err) {}
  };

  const getTotalProposals = async () => {
    try {
      const contract = await getSignerOrProviderDAO();
      const props = await contract.numProposals();
      // console.log(parseInt(props));
      setNumProposals(parseInt(props));
    } catch (err) {}
  };

  const getTreasuryBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(DAOAddress);
      // console.log("heh", formatEther(parseInt(treasuryBalance).toString(3)));
      setTreasuryBalance(parseInt(balance));
    } catch (err) {
      const a = JSON.stringify(err);
      // console.log(JSON.parse(a).reason);
      toast.error(JSON.parse(a).reason, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const createProposal = async () => {
    try {
      setLoading(true);
      const contract = await getSignerOrProviderDAO(true);

      const tx = await contract.createProposal(fakeNftTokenId);
      await tx.wait();
      setLoading(false);
      getTotalProposals();
      // getProposals();

      toast.success("Successfuly created", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      setLoading(false);
      const a = JSON.stringify(err);
      toast.error(JSON.parse(a).reason, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const getProposals = async () => {
    try {
      const contract = await getSignerOrProviderDAO();
      let tempAr = [];

      for (let i = 0; i < numProposals; i++) {
        const props = await contract.proposals(i);
        let date = new Date(parseInt(props.deadline) * 1000);
        let temp = {
          proposalId: i,
          nftTokenId: parseInt(props.nftTokenId),
          deadline: date.toLocaleString(),
          noVotes: parseInt(props.noVotes),
          yesVotes: parseInt(props.yesVotes),
          executed: props.executed,
        };
        console.log(
          Date.parse(temp.deadline) / 1000 < Math.floor(Date.now() / 1000)
        );
        console.log(
          Date.parse(temp.deadline) / 1000,
          Math.floor(Date.now() / 1000)
        );

        // console.log(JSON.stringify(props), "heh");
        console.log(temp, "jaa");
        tempAr.push(temp);
      }
      // console.log(tempAr, "ar");
      setProposals(tempAr);
    } catch (err) {
      const a = JSON.stringify(err);
      // console.log(JSON.parse(a).reason);
      toast.error(JSON.parse(a).reason, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const executeProposal = async (id) => {
    try {
      // console.log(id, "hehe");
      const contract = await getSignerOrProviderDAO(true);
      const tx = await contract.executeProposal(id);
      setLoading(true);
      tx.wait();

      toast.success("Success", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      getProposals();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const a = JSON.stringify(err);
      toast.error(JSON.parse(a).reason, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalance === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }

  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          <ToastContainer />

          {proposals.map((p, index) => (
            <div key={index} className={styles.proposalCard}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT ID to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline}</p>
              <p>Yes Votes: {p.yesVotes}</p>
              <p>No Votes: {p.noVotes}</p>
              <p>Executed: {p.executed.toString()}</p>
              {Date.parse(p.deadline) / 1000 > Math.floor(Date.now() / 1000) ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "Yes")}
                  >
                    Vote Yes
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "No")}
                  >
                    Vote No
                  </button>
                </div>
              ) : Date.parse(p.deadline) / 1000 <
                  Math.floor(Date.now() / 1000) &&
                p.executed.toString() === "false" ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal {p.yesVotes > p.noVotes ? "(Yes)" : "(No)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  useEffect(() => {
    getTreasuryBalance();
    getTotalProposals();
    isWalletDisconnectedOrConnected();
  });
  useEffect(() => {
    getProposals();
  }, [numProposals]);

  useEffect(() => {
    if (currentAccount) {
      getNftBalance();
      checkOwner();
    }
  }, [currentAccount]);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (account) => {
      setCurrentAccount(account);
    });

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  });

  return (
    <div>
      <ToastContainer />
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {currentAccount ? (
        currentAccount
      ) : (
        <button onClick={connectWallet}> connect wallet</button>
      )}

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalance}
            <br />
            Treasury Balance:{" "}
            {formatEther(parseInt(treasuryBalance).toString())} ETH
            <br />
            Total Number of Proposals: {numProposals}
          </div>
          <div className={styles.flex}>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("Create Proposal")}
            >
              Create Proposal
            </button>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("View Proposals")}
            >
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {/* Display additional withdraw button if connected wallet is owner */}
          {isOwner ? (
            <div>
              {loading ? (
                <button className={styles.button}>Loading...</button>
              ) : (
                <button className={styles.button} onClick={withdrawDAOEther}>
                  Withdraw DAO ETH
                </button>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        <div>
          <img className={styles.image} src="/cryptodevs/0.svg" />
        </div>
      </div>
      <footer className={styles.footer}>Crypto Devs by Asmar</footer>
    </div>
  );
}
