import fetch from 'node-fetch';
fetch('https://www.rottentomatoes.com/browse/movies_in_theaters/', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    }
}).then(res => res.text()).then(text => console.log(text.substring(0, 500))).catch(console.error);
