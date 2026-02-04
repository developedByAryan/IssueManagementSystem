from pydantic import BaseModel

class UserModel(BaseModel):
    username:str
    email:str
    
class UserRequest(UserModel):
    password:str


class UserResponse(UserModel):
    pass

