import AuthService from '../services/auth-service';
import { registerSchema, loginSchema } from '../validation-schemas/auth';
import { checkAndThrowError, validateSchema } from '../utils/error-utils';


export default class AuthController {
    private _authService = new AuthService();


    public async register({ name, email, password }: {
        name: string
        email: string
        password: string
    }) {
        const validationResult = validateSchema(registerSchema, { name, email, password });
        checkAndThrowError(validationResult)
        const { token } = await this._authService.register({ name: name, email: email, password: password });
        return { token };
    }


    public async login(email: string, password: string) {
        const validationResult = validateSchema(loginSchema, { email, password });
        checkAndThrowError(validationResult)
        const { token } = await this._authService.login(email, password)
        return { token };
    }


    public async logout() {
        await this._authService.logout()
    }
}


