import { Flex, Heading } from '@chakra-ui/react';

export const Page404 = () => {
  return (
    <Flex
      w='100%'
      direction='column'
      alignItems='center'
      justifyContent='center'
    >
      <Heading fontFamily='spaceMono' mt='2rem'>
        Page not found
      </Heading>
    </Flex>
  );
};
