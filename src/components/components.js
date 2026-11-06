export default function SettingScreen({ navigation }) {
  return (
    <Button 
      title="Новая игра" 
      onPress={() => navigation.navigate('NewGame')}
    />
  );
}
