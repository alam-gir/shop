import { FC } from 'react'
import { Button } from '../ui/button'

interface AuthButtonProps {
  
}

const AuthButton: FC<AuthButtonProps> = ({}) => {
  return <div>
    <Button className='text-primary-foreground md:text-lg font-semibold'>Sign In</Button>
  </div>
}

export default AuthButton