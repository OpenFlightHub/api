import * as request from "supertest"
import app from './../../app'
import makeJestOpenAPI from './_makeJestOpenAPI'

makeJestOpenAPI()

describe('GET /auth/check', ()=>{

    it('should return 401 if no cookie set', async()=>{

        const res = await request(app)
            .get('/auth/check')
            .send()

        expect(res.statusCode).toEqual(401)
        expect(res).toSatisfyApiSpec()
    })

    it('should return 401 if wrong cookie value', async()=>{

        const res = await request(app)
            .get('/auth/check')
            .set('Cookie', 'user-auth=wrong')
            .send()

        expect(res.statusCode).toEqual(401)
        expect(res).toSatisfyApiSpec()
    })


    it('should return user if cookie set', async()=>{

        const res = await request(app)
            .get('/auth/check')
            .set('Cookie', ['user-auth=session_4'])
            .send()

        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({id: 4})
        expect(res).toSatisfyApiSpec()
    })

})


describe('POST /auth/login', ()=>{

    it('should return 400 if no data', async()=>{

        const res = await request(app)
            .post('/auth/login')
            .send()

        expect(res.statusCode).toEqual(400)
        expect(res).toSatisfyApiSpec()
    })

    it('should return 400 if too long password', async()=>{

        const res = await request(app)
            .post('/auth/login')
            .send({
                password: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
            })

        expect(res.statusCode).toEqual(400)
        expect(res).toSatisfyApiSpec()
    })

    it('should return 418 if invalid credentials', async()=>{

        const res = await request(app)
            .post('/auth/login')
            .send({
                username: 'invalid',
                password: 'invalid'
            })

        expect(res.statusCode).toEqual(418)
        expect(res).toSatisfyApiSpec()
    })

    it('should return user if valid credentials', async()=>{

        const res = await request(app)
            .post('/auth/login')
            .send({
                username: 'email@alexh.rocks',
                password: 'CorrectBatteryHorseStaple'
            })

        expect(res.statusCode).toEqual(200)
        expect(res.get('Set-Cookie')[0]).toMatch(/.*user-auth=.*/)
        expect(res.body).toEqual({id: 1})
        expect(res).toSatisfyApiSpec()
    })

})


describe('POST /auth/login-with-token', ()=>{

    it('should return 400 if no data', async()=>{

        const res = await request(app)
            .post('/auth/login-with-token')
            .send()

        expect(res.statusCode).toEqual(400)
        expect(res).toSatisfyApiSpec()
    })

    it('should return 418 if invalid token', async()=>{

        const res = await request(app)
            .post('/auth/login-with-token')
            .send({
                token: 'invalid'
            })

        expect(res.statusCode).toEqual(418)
        expect(res).toSatisfyApiSpec()
    })

    it('should return user if valid token', async()=>{

        const res = await request(app)
            .post('/auth/login-with-token')
            .send({
                token: 'token_2'
            })

        expect(res.statusCode).toEqual(200)
        expect(res.get('Set-Cookie')[0]).toMatch(/.*user-auth=.*/)
        expect(res.body).toEqual({id: 2})
        expect(res).toSatisfyApiSpec()
    })

})
