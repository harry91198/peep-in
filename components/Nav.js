import { ReactNode } from 'react';
import { useRouter } from 'next/router';

import {
  Box,
  Flex,
  Avatar,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
} from '@chakra-ui/react';
import { AddIcon, SunIcon, ViewIcon } from '@chakra-ui/icons';

import { ConnectButton } from "@rainbow-me/rainbowkit";

const NavLink = ({ children }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}>
    {children}
  </Link>
);

export default function Nav(props) {
  console.log("nv ke props", props);
  const { colorMode, toggleColorMode } = useColorMode();
  // console.log("colorMode", colorMode);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  console.log("router", router.pathname);


  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>
            <Link href="/">
              <ViewIcon boxSize={10} color={'#ffe53d'} />
            </Link>
          </Box>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Link href={
                router.route === "/register" ? "/" : "/register"
              }>
              <Button leftIcon={<AddIcon />} colorScheme='orange' size='xs' mt={2} mr={-15}>
                {
                  router.route === "/register" ? "Give Review" : "Register your company"
                }
              </Button>
              </Link>
              <ConnectButton accountStatus="avatar" showBalance={true} chainStatus="icon" />
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                          

                </MenuButton>
                <MenuList alignItems={'center'}>
                  <br />
                  <Center>
                    <Avatar
                      size={'2xl'}
                      src={'https://avatars.dicebear.com/api/male/username.svg'}
                    />
                  </Center>
                  <br />
                  <Center>
                    <p>Username</p>
                  </Center>
                  <br />
                  <MenuDivider />
                  <MenuItem>Your Servers</MenuItem>
                  <MenuItem>Account Settings</MenuItem>
                  <MenuItem>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}