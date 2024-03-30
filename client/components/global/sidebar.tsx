import { FC } from 'react'

interface SidebarProps {
  
}

const Sidebar: FC<SidebarProps> = ({}) => {
  return <div className='h-full w-[20rem] border-r sticky top-0 left-0 bg-background'>Sidebar</div>
}

export default Sidebar