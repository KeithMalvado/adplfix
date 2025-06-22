import { StyleSheet, Text, View } from "react-native";
import react from "react";

const Page = () => {
 return (
 <View styles={styles.container}>
  <Text>Oi</Text>
 </View>
 )
}

export default Page

const styles = StyleSheet.create({
 container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 }
})