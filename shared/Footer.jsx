import { Flex, Link, Text } from '@chakra-ui/react';

export const Footer = () => {
  return (
    <Flex
      direction={{ base: 'column-reverse', md: 'row', lg: 'row' }}
      alignItems='flex-start'
      justifyContent='space-between'
      w='100%'
      mt='auto'
    >
      <Text
        mb='2rem'
        fontSize='sm'
        fontFamily='figTree'
        color='greyLight'
        mx='auto'
      >
        Built by{' '}
        <Link
          href='https://twitter.com/saimano1996'
          isExternal
          textDecoration='underline'
        >
          Saimano
        </Link>
      </Text>
    </Flex>
  );
};
