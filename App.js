import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeAdmin from "./screen/user/admin/HomeAdmin";
import WelcomeScreen from "./screen/WelcomeScreen";
import HomescreenPetugas from "./screen/Petugas/HomescreenPetugas";
import LoginScreen from "./screen/LoginScreen";
import SignUpScreen from "./screen/SignUpScreen";
import HomeScreen from "./screen/HomeScreen";
import TambahBarang from "./screen/barang/TambahBarang";
import EditUser from "./screen/user/EditUser";
import Pembayaran from "./screen/Lelang/Pembayaran";
import ScreenDataUser from "./screen/user/data/ScreenDataUser";
import DaftarBarang from "./screen/Lelang/DaftarLelang";
import DetailLelang from "./screen/Lelang/DetailBarang";
import IkutLelang from "./screen/Lelang/ikutlelang";
import ProfileScreen from "./screen/ProfileScreen";
import RiwayatLelang from "./screen/Lelang/RiwayatLelang";
import { StripeProvider } from '@stripe/stripe-react-native';
import CariAdmin from "./screen/user/admin/SearchAdmin";
import CariBarang from "./screen/Lelang/CariBarang";
import Pesan from "./screen/Lelang/Pesan";
import AdminScreen from "./screen/user/admin/inputrekomen";
import Cam from "./screen/cam";
import ProfilPetugas from "./screen/Petugas/ProfilPetugas";
const Stack = createNativeStackNavigator();

export default function App() {
  const [barang, setBarang] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAddBarang = (name) => {
    const newItem = { id: Date.now().toString(), name };
    setBarang((prevBarang) => [...prevBarang, newItem]);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setSelectedUser(updatedUser);
  };

  return (
    <StripeProvider publishableKey="pk_test_51QUWjzDRTy3ktVhtpWMH5dkA59NSckfxQE6FaiA934SdluctpeHpSfCqqzQt3W0tVp6CM8Yxgc7q09y1LUINkrPM00gmDmCSiX">
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Pesan"component={Pesan}/>
          <Stack.Screen name="ProfilPetugas"component={ProfilPetugas}/>
          <Stack.Screen name="CariBarang" component={CariBarang}/>
          <Stack.Screen name="CariRole" component={CariAdmin}/>
          <Stack.Screen name="Pembayaran" component={Pembayaran} />
          <Stack.Screen name="RiwayatLelang" component={RiwayatLelang} />
          <Stack.Screen name="DetailBarang" component={DetailLelang} />
          <Stack.Screen name="DaftarBarang" component={DaftarBarang} />
          <Stack.Screen name="HomeAdmin" component={HomeAdmin} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignUpScreen} />
          <Stack.Screen name="DataUser" component={ScreenDataUser} />
          <Stack.Screen name="HCpetugas" component={HomescreenPetugas}/>
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Cam" component={Cam} />
          <Stack.Screen name="Home">
            {(props) => <HomeScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="TambahBarang">
            {(props) => <TambahBarang {...props} onAdd={handleAddBarang} />}
          </Stack.Screen>
          <Stack.Screen name="EditUser">
            {(props) => (
              <EditUser
                {...props}
                user={selectedUser}
                onSave={handleUpdateUser}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="DataDiri">
            {(props) => <ScreenDataUser {...props} />}
          </Stack.Screen>
          <Stack.Screen name="ikutlelang" component={IkutLelang} />
          <Stack.Screen name="DetailLelang" component={DetailLelang} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}