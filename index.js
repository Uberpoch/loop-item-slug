const axios = require('axios');
const fs = require('fs');


const clientID = '';
const secretKey = '';


const ogItems = require('./source.js');


const auth = async (key, secret) => {
    return axios.post('https://v2.api.uberflip.com/authorize', {
        grant_type:	'client_credentials',
        client_id: key,
        client_secret: secret
    })
    .then(function (response) {
        // tokenType = response.data.token_type;
        const token = response.data.access_token;
        // console.log(token);
        return token;
    })
    .catch(function (error) {
        console.log(error);
    });

}

const slugCall = async (token, itemId, itemSlug) => {
    axios.put(`https://v2.api.uberflip.com/items/${itemId}/url-path`,
    {
        url_slug: itemSlug
    },
    {
        headers: {'authorization': `Bearer ${token}`}
    })
    .then(res => {

            let data = {itemID: res.data.id};
            console.log(data);
    })
    .catch(err => {
        console.log(err.config.url, err.config.data, err.response.status, err.response.statusText);
        return;
    })
};

const slugPlusCall = async (token, itemId, itemSlug) => {
    axios.put(`https://v2.api.uberflip.com/items/${itemId}/url-path`,
    {
        url_slug: itemSlug
    },
    {
        headers: {'authorization': `Bearer ${token}`}
    })
    .then(res => {
        let data = res.data.id;
        getSecondary(token, data);
    })
    .catch(err => {
        console.log(err);
    })
};

const getSecondary = async (token, itemId)  => {
    axios.get(`https://v2.api.uberflip.com/items/${itemId}/secondary-url-paths`,{
        headers: {'authorization': `Bearer ${token}`}
    })
    .then(res => {
        let array = [] = res.data.data;
        deleteLoop(token, array);
    })
    .catch(err => {
        let getError = `getError:${err.status}, ${err.config.url}, ${err.config.data}`;
        console.log(getError);
    })
}

const deleteSecondary = async (token, item) => {
    axios.delete(`https://v2.api.uberflip.com/items/${item.item_id}/secondary-url-paths/${item.id}`,
    {
        headers: {'authorization': `Bearer ${token}`}
    })
    .then(res => {
        let deleteMessage = {status: res.status, path: res.config.url};
        console.log(deleteMessage);
    })
    .catch(err => {
        console.log(err);
    })
}

const deleteLoop = async (token, array) => {
    array.forEach(item => {
        deleteSecondary(token, item);
    })
}

const callLoop = async (token, array) => {
    array.forEach(item => {
        if(item.removeOld === undefined || item.removeOld !== true){
            slugCall(token, item.id, item.slug)
        }
        else {
            slugPlusCall(token, item.id, item.slug);
        }
    })
}


const run = async () => {
    const token = await auth(clientID, secretKey);
    console.log('Token Created');
    const slugReplaced = await callLoop(token, ogItems);

};
run();