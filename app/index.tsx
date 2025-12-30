import { ImageBackground, View,Text,StyleSheet,  } from 'react-native'
import React from 'react'
import Mybutton from '@/components/Mybutton'
import { useRouter } from 'expo-router'
import "@gluestack-ui/core/toast/creator"


const Index = () => {
  const router = useRouter();

  const onLogin = () => {
    router.push('/login')
  }
  const onSignUp = () => {
    router.push('/signup')
  }
  return (
      <ImageBackground 
        source={require('@/assets/images/fitcore.jpg')}
        style={styles.background}
        resizeMode='cover'
      >
         
        <View style={styles.content}>
          
          <View style ={{gap:15,alignItems:'center',justifyContent:'flex-end',height:200}}>
          <View style={{justifyContent:'center',alignItems:'center',paddingBottom:30,paddingLeft:10}}>
            <Text style={styles.brandname}>FitCore</Text>
          </View>
          <Mybutton title ={'Login'} onPress={onLogin} />
          <Mybutton title ={'Sign Up'} onPress={onSignUp}/>
          </View>
        </View>
      </ImageBackground>
  
  )
}

export default Index

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding:0,
    margin:0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap:30,
    backgroundColor : 'rgba(0, 0, 0, 0.4)'    
  },
  text: {
    color: 'white',
    fontSize: 24,
  },
  brandname: {
    fontSize: 50,
    color: '#d1dbe6ff',
    fontWeight:800
  }
})