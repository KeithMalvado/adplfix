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
import ProfileScreen from "./screen/ProfileScreen";
import { StripeProvider } from '@stripe/stripe-react-native';
import CariAdmin from "./screen/user/admin/SearchAdmin";
import Artikel from "./screen/Lelang/artikel";
import Pesan from "./screen/Lelang/Pesan";
import AdminScreen from "./screen/user/admin/inputrekomen";
import Cam from "./screen/Petugas/cam";
import DetailArtikel from "./screen/Lelang/DetailArtikel";
import ProfilPetugas from "./screen/Petugas/ProfilPetugas";
import Riwayat from "./screen/Petugas/riwayattelur";
import Cart from "./screen/cart"
import LihatProduk from "./screen/Petugas/LihatProduk";
import ArtikelPetugas from "./screen/Petugas/ArtikelPetugas";
import LihatPesanan from "./screen/Petugas/LihatPesanan";
import TambahArtikel from "./screen/Petugas/TambahArtikel";
import EditArtikel from "./screen/Petugas/EditArtikel";

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
          <Stack.Screen name="ArtikelPetugas" component={ArtikelPetugas}/>
          <Stack.Screen name="ProfilPetugas"component={ProfilPetugas}/>
          <Stack.Screen name="Artikel" component={Artikel}/>
          <Stack.Screen name="CariRole" component={CariAdmin}/>
          <Stack.Screen name="Pembayaran" component={Pembayaran} />
          <Stack.Screen name="DaftarBarang" component={DaftarBarang} />
          <Stack.Screen name="HomeAdmin" component={HomeAdmin} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignUpScreen} />
          <Stack.Screen name="DataUser" component={ScreenDataUser} />
          <Stack.Screen name="HCpetugas" component={HomescreenPetugas}/>
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Cam" component={Cam} options={{ title: 'Deteksi Telur' }} />
          <Stack.Screen name="Riwayat" component={Riwayat} options={{ title: 'Riwayat Deteksi' }} />
          <Stack.Screen name="DetailArtikel" component={DetailArtikel} />
          <Stack.Screen name="Cart" component={Cart}/>
          <Stack.Screen name="LihatProduk" component={LihatProduk}/>
          <Stack.Screen name="LihatPesanan" component={LihatPesanan}/>
          <Stack.Screen name="TambahArtikel" component={TambahArtikel}/>
          <Stack.Screen name="EditArtikel" component={EditArtikel}/>
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
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}