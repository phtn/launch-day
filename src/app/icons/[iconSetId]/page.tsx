import { Content } from './content'
type Props = {
  params: Promise<{
    iconSetId: string
  }>
}

const Page = async ({ params }: Props) => {
  const iconSetId = (await params).iconSetId
  return <Content iconSetId={iconSetId} />
}

export default Page
