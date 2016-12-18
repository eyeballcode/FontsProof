# FontsProof

Just needa collect the sites you visit thats all bye.

Oh and link your google account to it.

#Format
--------

User account format in DB:

    {
        googleAccount: 'Little Bobby Tables',
        ipAddress: '127.0.0.1',
        cookies: ['cookie1', 'cookie2'],
        sites: [
            ...
        ]
    }

Site format in DB:

    {
        url: 'http://google.com',
        time: someTime
    }

Signin format in DB:

    {
        identifier: 'queryString',
        data: {
            googleAccount: 'Little Bobby Tables'
        }
    }
