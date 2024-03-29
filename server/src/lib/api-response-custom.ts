export class ApiError extends Error {
    public statusCode: number;
    
    constructor(public status: number, public message: string) {
        super(message);
        this.statusCode = status;
    }

}
