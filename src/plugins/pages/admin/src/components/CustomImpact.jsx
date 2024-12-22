import React from 'react';
import { TextInput, Box, Button } from '@strapi/design-system';
import axios from 'axios';

const CustomImpact = (props) => {

    const updateValue  =async() => {
        const res = await axios.get('http://localhost:1337/api/pages');
        console.log(res);
    }
  return (
     <Box>
      <Button onClick={() => updateValue()}>
        Add Item
      </Button>
    </Box>
  );
};

export default CustomImpact;
