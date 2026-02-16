
const LoginForm = () => {
    return (
        <form className="flex max-w-75 flex-col gap-2 text-black">
            <div className="flex flex-col gap-2">
                <input id="name" name="name" placeholder="Name" />
            </div>
            <div className="flex flex-col gap-2">
                <input id="email" name="email" placeholder="Email" />
            </div>

            <div className="flex flex-col gap-2">
                <input id="password"
                    name="password"
                    type="password"
                    placeholder='Password' />
            </div>
        </form>
    )
}

export default LoginForm
