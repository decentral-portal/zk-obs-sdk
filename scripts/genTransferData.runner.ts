// author @rayhuang
import { BytesLike, utils, BigNumber } from 'ethers';
import { sign, Point } from '@noble/secp256k1';
import MerkleTree from 'merkletreejs';
import fs from 'fs';
const circomlib = require('circomlib');
const mimcjs = circomlib.mimc7;

const num = 8;
const sender_id: string[] = new Array(num);
const receiver_id: string[] = new Array(num);
const sender_nonce: string[] = new Array(num);
const delta_state: string[] = new Array(num);
const acc_root_flow: string[] = new Array(2 * num + 1);
const sender_addr: string[] = new Array(num);
const old_sender_state: string[] = new Array(num);
const new_sender_state: string[] = new Array(num);
const receiver_addr: string[] = new Array(num);
const receiver_nonce: string[] = new Array(num);
const old_receiver_state: string[] = new Array(num);
const new_receiver_state: string[] = new Array(num);
const sender_proof: string[][] = new Array(num);
const receiver_proof: string[][] = new Array(num);
const sig_r: string[][] = new Array(num);
const sig_s: string[][] = new Array(num);
const sig_pubkey: string[][][] = new Array(num);
const sig_tx_hash: string[] = new Array(num);

//TODO: generate transfer input data
function genTransferData() {
  //TODO generate sender_id
  for (let i = 0; i < num; i++) {
    sender_id[i] = BigNumber.from('0').toString();
  }
  //TODO generate receiver_id
  for (let i = 0; i < num; i++) {
    receiver_id[i] = BigNumber.from('2').toString();
  }
  //TODO generate sender_nonce
  for (let i = 0; i < num; i++) {
    sender_nonce[i] = BigNumber.from('0').toString();
  }
  //TODO generate delta_state
  for (let i = 0; i < num; i++) {
    delta_state[i] = BigNumber.from('10').toString();
  }
  //TODO generate acc_root_flow
  //TODO generate sender_addr
  //TODO generate old_sender_state
  //TODO generate new_sender_state
  //TODO generate receiver_addr
  //TODO generate receiver_nonce
  //TODO generate old_receiver_state
  //TODO generate new_receiver_state
  //TODO generate sender_proof
  //TODO generate receiver_proof
  //TODO generate sig_r
  //TODO generate sig_s
  //TODO generate sig_pubkey
  //TODO generate sig_tx_hash

  outputJsonfile();
}

function outputJsonfile() {
  const data = {
    sender_id: sender_id,
    receiver_id: receiver_id,
    sender_nonce: sender_nonce,
    delta_state: delta_state,
    acc_root_flow: acc_root_flow,
    sender_addr: sender_addr,
    old_sender_state: old_sender_state,
    new_sender_state: new_sender_state,
    receiver_addr: receiver_addr,
    receiver_nonce: receiver_nonce,
    old_receiver_state: old_receiver_state,
    new_receiver_state: new_receiver_state,
    sender_proof: sender_proof,
    receiver_proof: receiver_proof,
    sig_r: sig_r,
    sig_s: sig_s,
    sig_pubkey: sig_pubkey,
    sig_tx_hash: sig_tx_hash
  };
  console.log(data);
  fs.writeFileSync('transferData.json', JSON.stringify(data));
}