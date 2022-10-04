import { Box, useRadio, useRadioGroup, HStack, VStack } from '@chakra-ui/react';

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        color='black'
        boxShadow='md'
        border='1px solid black'
        borderRadius='5px'
        fontFamily='openSans'
        fontSize='.8rem'
        fontWeight='bold'
        _checked={{
          bg: 'black',
          color: 'white'
        }}
        px={2}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  );
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
function RadioBox(props) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: props.name,
    defaultValue: props.defaultValue,
    onChange: (e) => {
      props.updateRadio(e);
    }
  });

  const group = getRootProps();

  return (
    <HStack {...group}>
      {props.options.map((value) => {
        const radio = getRadioProps({ value });
        return (
          <RadioCard key={value} {...radio}>
            <i className='fa-solid fa-stopwatch'></i> {value}
          </RadioCard>
        );
      })}
    </HStack>
  );
}

export default RadioBox;
