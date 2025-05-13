import { Box, Text, Flex, Link } from '@chakra-ui/react'
import React from 'react'

const Footer = () => {
  return (
    <Box
      bg='teal.800'
      p={6}
      w='full'
      mt='4'
      textAlign='center'
      as="footer"
    >
      <Flex direction="column" align="center" gap={2}>
        <Text fontSize="lg" fontWeight="bold" color="white">
          NLP Speech Translator
        </Text>
        <Text fontSize="sm" color="whiteAlpha.700">
          &copy; {new Date().getFullYear()} All rights reserved.
        </Text>
      </Flex>
    </Box>
  )
}

export default Footer
