import axios from 'axios';
import { assetAPI, transactionAPI, portfolioAPI, goalAPI } from '../services/api';

jest.mock('axios');
const mockedAxios = axios;

describe('API Services', () => {
  beforeEach(() => {
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assetAPI', () => {
    it('should get all assets', async () => {
      const mockAssets = [{ id: 1, asset_name: 'Apple Inc.' }];
      mockedAxios.create().get.mockResolvedValue({ data: mockAssets });

      const result = await assetAPI.getAll();
      
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/assets');
      expect(result.data).toEqual(mockAssets);
    });

    it('should create new asset', async () => {
      const newAsset = { asset_name: 'Tesla Inc.', asset_type: 'Stock' };
      const mockResponse = { id: 1, message: 'Created' };
      mockedAxios.create().post.mockResolvedValue({ data: mockResponse });

      const result = await assetAPI.create(newAsset);
      
      expect(mockedAxios.create().post).toHaveBeenCalledWith('/assets', newAsset);
      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('transactionAPI', () => {
    it('should get all transactions', async () => {
      const mockTransactions = [{ id: 1, asset_name: 'Apple Inc.' }];
      mockedAxios.create().get.mockResolvedValue({ data: mockTransactions });

      const result = await transactionAPI.getAll();
      
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/transactions');
      expect(result.data).toEqual(mockTransactions);
    });
  });

  describe('portfolioAPI', () => {
    it('should get portfolio summary', async () => {
      const mockSummary = { totalInvestment: '15000.00', currentValue: '17500.00' };
      mockedAxios.create().get.mockResolvedValue({ data: mockSummary });

      const result = await portfolioAPI.getSummary();
      
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/portfolio/summary');
      expect(result.data).toEqual(mockSummary);
    });
  });
});