from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
import boto3
import json

questions_routes = Blueprint('questions', __name__)

# SageMaker setup
sagemaker_client = boto3.client('sagemaker-runtime',region_name='us-east-1')
SAGEMAKER_ENDPOINT_NAME = "sagemaker-xgboost-2024-11-10-14-28-58-701"

def get_prediction_from_sagemaker(encoded_data):
    # Convert the encoded data list to a CSV string
    payload = ','.join(map(str, encoded_data))  # Create a CSV string from the list
    response = sagemaker_client.invoke_endpoint(
        EndpointName=SAGEMAKER_ENDPOINT_NAME,
        ContentType="text/csv",
        Body=payload
    )
    result = json.loads(response['Body'].read().decode())
    return result

# Define your encoding dictionary
encoding_dict = {
    'Body Type': {'overweight': 0, 'obese': 1, 'underweight': 2, 'normal': 3},
    'Sex': {'female': 0, 'male': 1},
    'Diet': {'pescatarian': 0, 'vegetarian': 1, 'omnivore': 2, 'vegan': 3},
    'How Often Shower': {'daily': 0, 'less frequently': 1, 'more frequently': 2, 'twice a day': 3},
    'Heating Energy Source': {'coal': 0, 'natural gas': 1, 'wood': 2, 'electricity': 3},
    'Transport': {'public': 0, 'walk/bicycle': 1, 'private': 2},
    'Vehicle Type': {'none': 0, 'petrol': 1, 'diesel': 2, 'hybrid': 3},
    'Social Activity': {'often': 0, 'never': 1, 'sometimes': 2},
    'Frequency of Traveling by Air': {'frequently': 0, 'rarely': 1, 'never': 2, 'very frequently': 3},
    'Waste Bag Size': {'large': 0, 'extra large': 1, 'small': 2, 'medium': 3},
    'Energy efficiency': {'No': 0, 'Sometimes': 1, 'Yes': 2}
}


# Encoding function
def encode_data(dataframe, encoding_dict):
    encoded_df = dataframe.copy()
    for column, mappings in encoding_dict.items():
        encoded_df[column] = encoded_df[column].map(mappings)
    return encoded_df


# Example protected route to handle the questionnaire submission
@questions_routes.route('/submit-questionnaire', methods=['POST'])
@jwt_required()  # This decorator validates the JWT token
def submit_questionnaire():
    current_user = get_jwt_identity()  # Retrieves identity stored in the token
    
    # Your logic for handling questionnaire data goes here
    data = request.get_json()
    # Assuming `data` contains the questionnaire responses

    # Convert JSON to DataFrame with appropriate column names for encoding
    df = pd.DataFrame([{
        'Body Type': data.get('bodyType'),
        'Sex': data.get('sex'),
        'Diet': data.get('diet'),
        'How Often Shower': data.get('showerFrequency'),
        'Heating Energy Source': data.get('heatingEnergySource'),
        'Transport': data.get('transport'),
        'Vehicle Type': data.get('vehicleType'),
        'Social Activity': data.get('socialActivity'),
        'Monthly Grocery Bill':data.get('monthlyGroceryBill'),
        'Frequency of Traveling by Air': data.get('travelFrequency'),
        'Vehicle Monthly Distance Km':data.get('vehicleDistance'),
        'Waste Bag Size': data.get('wasteBagSize'),
        'Waste Bag Weekly Count':data.get('wasteBagCount'),
        'How Long TV PC Daily Hour':data.get('screenTime'),
        'How Many New Clothes Monthly':data.get('newClothes'),
        'How Long Internet Daily Hour':data.get('internetTime'),
        'Energy efficiency': data.get('energyEfficiency')
    }])

    # Encode the data
    encoded_df = encode_data(df, encoding_dict)

    # Extract encoded values as a list
    encoded_list = encoded_df.iloc[0].tolist()
    print(encoded_list)
    carbonEmissionPredictedValue=get_prediction_from_sagemaker(encoded_list)
    
    return jsonify({
        "msg": "Questionnaire submitted successfully",
        "user": current_user,
        "data": carbonEmissionPredictedValue
    }), 200