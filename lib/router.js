const express = require('express');
const config = require('config');
const server2Config = config.remoteServices.server2 || {};
const router = express.Router();
const got = require('got');
const {getItemById, insertItem} =  require('./storage');
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const LOGIN = '/login';
const GET_SETTINGS = '/settings';

//todo maybe add sessions?

function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const authenticateUser = (req,res,next) =>{
    const authHeader = req.headers['authorization'];
    const incomingToken = authHeader && authHeader.split(' ')[1]; //don't care about bearer
    if (!incomingToken){
        return res.sendStatus(401);
    }
    jwt.verify(incomingToken, process.env.TOP_SECRET_KEY,(err,user)=>{
        if(err){
            console.error('error authenticating user');
            return res.status(403).send('go away unauthenticated user!');
        }
        req.user = user; // binding the authenticated user to req object to next flow
        next();
    })
}

router.post(LOGIN, async  function (req, res) {
    const {email, name} = req.body;
    if(!email || !name){
        return res.status(400).send("email and name are required");
    }
    const userEmail = email.toLowerCase().trim();
    try {
        const user = await getItemById('users', userEmail || "");
        if (!user){
            return res.status(401).send('User not exist')
        }
        const userNewJwt = await jwt.sign({email:userEmail, name}, process.env.TOP_SECRET_KEY);
        return res.json({ token: userNewJwt})
    } catch (e) {
        console.error('error getting user from info');
        return res.status(500).send(`error in login: ${e.message}`);
    }
})

router.get(GET_SETTINGS, authenticateUser, async (req,res)=>{
        const encrypedSettings = await got(`${server2Config.baseUrl}/${server2Config.apis.getSettings}`);
        const dec = decrypt(encrypedSettings);
        //decrypt
})




module.exports = router;


